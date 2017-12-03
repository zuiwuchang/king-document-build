package controllers

import (
	"fmt"
	"github.com/revel/revel"
	"king-document-build/app/modules/db/data"
	"king-document-build/app/modules/db/manipulator"
)

type Files struct {
	*revel.Controller
}

func (this Files) Upload(id int64, dir string) revel.Result {
	file, header, err := this.Request.FormFile("imgFile")
	if err != nil {
		return this.RenderJSON(&struct {
			Error   int    `json:"error"`
			Message string `json:"message"`
		}{1, err.Error()})
	}
	defer file.Close()
	filename := header.Filename

	var mFiles manipulator.Files
	if err := mFiles.Upload(id, dir, filename, file); err != nil {
		return this.RenderJSON(&struct {
			Error   int    `json:"error"`
			Message string `json:"message"`
		}{1, err.Error()})
	}

	return this.RenderJSON(&struct {
		Error int    `json:"error"`
		Url   string `json:"url"`
	}{0, fmt.Sprintf("sections/%v/%s/%s", id, dir, filename)})
}
func (this Files) Find(id int64, order, dir string) revel.Result {
	var files data.Files
	var mFiles manipulator.Files
	if err := mFiles.Find(&files, id, order, dir); err != nil {
		return this.RenderJSON(&struct {
			Error   int    `json:"error"`
			Message string `json:"message"`
		}{1, err.Error()})
	}

	return this.RenderJSON(&files)
}
