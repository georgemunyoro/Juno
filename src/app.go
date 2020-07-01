
package main

import (
  id3 "github.com/mikkyang/id3-go"
  "fmt"
  "os"
)

func main() {
  file := os.Args[1:][0]
  mp3File, _ := id3.Open(file)
  image := mp3File.Frame("APIC")
  fmt.Printf("{ \"title\":\"%s\", \"artist\":\"%s\", \"album\":\"%s\", \"image\":\"%b\"}", mp3File.Title(), mp3File.Artist(), mp3File.Album(), image)
}
