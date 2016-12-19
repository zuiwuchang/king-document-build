package controllers

import (
	"fmt"
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
func (c App) Edit(id int64) revel.Result {
	if id == 0 {
		return c.RenderError(fmt.Errorf("document id not found (%v)", id))
	}
	document := data.Document{Id: id}
	var mDocument manipulator.Document
	if has, err := mDocument.Get(&document); err != nil {
		return c.RenderError(err)
	} else if !has {
		return c.RenderError(fmt.Errorf("document id not found (%v)", id))
	}

	var mChapter manipulator.Chapter
	var chapters []data.Chapter
	if err := mChapter.FindByDoc(id, &chapters); err != nil {
		return c.RenderError(err)
	}

	var tags []data.Tag
	var mTag manipulator.Tag
	err := mTag.Find(&tags)
	if err != nil {
		return c.RenderError(err)
	}
	return c.Render(document, tags, chapters, id)
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
