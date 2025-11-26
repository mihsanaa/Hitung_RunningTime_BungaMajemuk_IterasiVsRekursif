package main

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"
)

//struct

type MonthResult struct {
	Bulan      int     `json:"bulan"`
	Iterative  float64 `json:"iterative"`
	Recursive  float64 `json:"recursive"`
	TimeIterms float64 `json:"time_iter_ms"`
	TimeRekms  float64 `json:"time_rek_ms"`
}

type CalcResponse struct {
	P     float64           `json:"P"`
	R     float64           `json:"r"`
	Bulan int               `json:"bulan"`
	Data  []MonthResult     `json:"data"`
	Rumus map[string]string `json:"rumus"`
}

// algoritma

func iteratif(P, r float64, n int) float64 {
	//isi iteratif
}

func rekursif(P, r float64, n int) float64 {
	//isi rekursif
}

// parserquery

func parseFloatQuery(r *http.Request, key string, def float64) float64 {
	q := r.URL.Query().Get(key)
	if q == "" {
		return def
	}
	v, err := strconv.ParseFloat(q, 64)
	if err != nil {
		return def
	}
	return v
}

func parseIntQuery(r *http.Request, key string, def int) int {
	q := r.URL.Query().Get(key)
	if q == "" {
		return def
	}
	v, err := strconv.Atoi(q)
	if err != nil {
		return def
	}
	return v
}

// handler

func calcHandler(w http.ResponseWriter, r *http.Request) {

	P := parseFloatQuery(r, "P", 0)
	rPercent := parseFloatQuery(r, "r", 0)
	rBulan := rPercent / 100.0
	bulan := parseIntQuery(r, "bulan", 0)

	if bulan < 0 {
		bulan = 0
	}

	data := make([]MonthResult, 0, bulan+1)

	for i := 0; i <= bulan; i++ {
		loop := 1000000

		start := time.Now()
		var valIt float64
		for k := 0; k < loop; k++ {
			valIt = iteratif(P, rBulan, i)
		}
		durIt := float64(time.Since(start).Milliseconds()) / float64(loop)

		start2 := time.Now()
		var valRe float64
		for k := 0; k < loop; k++ {
			valRe = rekursif(P, rBulan, i)
		}
		durRe := float64(time.Since(start2).Milliseconds()) / float64(loop)

		data = append(data, MonthResult{
			Bulan:      i,
			Iterative:  valIt,
			Recursive:  valRe,
			TimeIterms: durIt,
			TimeRekms:  durRe,
		})
	}

	resp := CalcResponse{
		P:     P,
		R:     rBulan,
		Bulan: bulan,
		Data:  data,
	}

	w.Header().Set("Content-Type", "application/json")
	enc := json.NewEncoder(w)
	enc.Encode(resp)
}

// main

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/calc", calcHandler)

	// serve frontend folder "frontend"
	fs := http.FileServer(http.Dir("C:/Users/upgresik/OneDrive/Documents/strukturDat/tugasakabesar/frontend"))
	mux.Handle("/", fs)
	err := http.ListenAndServe(":8080", mux)
	if err != nil {
		panic(err)
	}
}
