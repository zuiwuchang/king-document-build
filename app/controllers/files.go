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

func (c Files) Upload(id int64, dir string) revel.Result {
	file, header, err := c.Request.FormFile("imgFile")
	if err != nil {
		return c.RenderJson(struct {
			Error   int    `json:"error"`
			Message string `json:"message"`
		}{1, err.Error()})
	}
	defer file.Close()
	filename := header.Filename

	var mFiles manipulator.Files
	if err := mFiles.Upload(id, dir, filename, file); err != nil {
		return c.RenderJson(struct {
			Error   int    `json:"error"`
			Message string `json:"message"`
		}{1, err.Error()})
	}

	return c.RenderJson(struct {
		Error int    `json:"error"`
		Url   string `json:"url"`
	}{0, fmt.Sprintf("sections/%v/%s/%s", id, dir, filename)})
}
func (c Files) Find(id int64, order, dir string) revel.Result {
	var files data.Files
	var mFiles manipulator.Files
	if err := mFiles.Find(&files, id, order, dir); err != nil {
		return c.RenderJson(struct {
			Error   int    `json:"error"`
			Message string `json:"message"`
		}{1, err.Error()})
	}

	return c.RenderJson(files)
}
