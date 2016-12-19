package controllers

import (
	"github.com/revel/revel"
	"modules/db/data"
	"modules/db/manipulator"
)

type App struct {
	*revel.Controller
}

func (c App) Index() revel.Result {
	return c.Render()
}

func (c App) Search() revel.Result {
	var tags []data.Tag
	var mTag manipulator.Tag
	err := mTag.Find(&tags)
	if err != nil {
		return c.RenderError(err)
	}

	var mDocunemt manipulator.Document
	var rows int64
	rows, err = mDocunemt.Count(0)
	if err != nil {
		return c.RenderError(err)
	}
	return c.Render(tags, rows)
}

func (c App) Document(id int64) revel.Result {
	return c.Render()
}
