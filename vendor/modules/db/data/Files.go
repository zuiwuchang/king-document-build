package data

import (
	"time"
)

type File struct {
	IsDir    bool      `json:"is_dir"`
	HasFile  bool      `json:"has_file"`
	FileSize int64     `json:"filesize"`
	DirPath  string    `json:"dir_path"`
	IsPhoto  bool      `json:"is_photo"`
	FileType string    `json:"filetype"`
	FileName string    `json:"filename"`
	DateTime time.Time `json:"datetime"`
}
type Files struct {
	Moveup   string `json:"moveup_dir_path"`
	Path     string `json:"current_dir_path"`
	Url      string `json:"current_url"`
	Count    int    `json:"total_count"`
	FileList []File `json:"file_list"`
}
