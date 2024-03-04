package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"sync"
	"time"

	"github.com/corpix/uarand"
)

var re = regexp.MustCompile(`<script id="__NEXT_DATA__".*?>(.*)</script>`)
var scrapedMu sync.RWMutex
var scraped []byte

func scrape() {
	req, err := http.NewRequest(http.MethodGet, "https://linktr.ee/linkart", nil)
	if err != nil {
		fmt.Printf("got error while preparing linktree request: %v", err)
		return
	}

	req.Header.Set("User-Agent", uarand.GetRandom())

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Printf("got error while requesting linktree: %v", err)
		return
	}

	body, err := io.ReadAll(res.Body)
	if err != nil {
		fmt.Printf("got error while reading linktree body: %v", err)
		return
	}

	var scrapedJSON struct {
		Props struct {
			PageProps struct {
				Account struct {
					Links json.RawMessage `json:"links"`
				} `json:"account"`
			} `json:"pageProps"`
		} `json:"props"`
	}
	if err := json.Unmarshal(re.FindSubmatch(body)[1], &scrapedJSON); err != nil {
		fmt.Printf("got error while unmarshalling linktree json: %v", err)
		return
	}

	scrapedMu.Lock()
	defer scrapedMu.Unlock()
	scraped = scrapedJSON.Props.PageProps.Account.Links
}

func getRoot(w http.ResponseWriter, r *http.Request) {
	// todo: restrict this once there's an actual domain
	w.Header().Add("Access-Control-Allow-Origin", "*")
	w.Header().Add("Cross-Origin-Resource-Policy", "cross-origin")
	w.Header().Add("Content-Type", "application/json")
	w.Header().Add("Content-Length", strconv.Itoa(len(scraped)))

	scrapedMu.RLock()
	defer scrapedMu.RUnlock()
	if _, err := w.Write(scraped); err != nil {
		fmt.Printf("got error while writing body: %v", err)
		return
	}
}

func main() {
	// begin scraper in background thread
	go func() {
		for {
			scrape()
			time.Sleep(time.Minute)
		}
	}()

	// https://www.digitalocean.com/community/tutorials/how-to-make-an-http-server-in-go
	http.HandleFunc("/", getRoot)

	fmt.Println("starting server on port", os.Getenv("PORT"))
	err := http.ListenAndServe(":"+os.Getenv("PORT"), nil)
	if errors.Is(err, http.ErrServerClosed) {
		fmt.Printf("server closed\n")
	} else if err != nil {
		fmt.Printf("error starting server: %s\n", err)
		os.Exit(1)
	}
}
