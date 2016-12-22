package controllers

import (
	"errors"
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

func (c App) Edit(id int64) revel.Result {
	if id == 0 {
		return c.RenderError(errors.New("chapter id not found (0)"))
	}
	chapter := data.Chapter{Id: id}
	var mChapter manipulator.Chapter
	if has, err := mChapter.Get(&chapter); err != nil {
		return c.RenderError(err)
	} else if !has {
		return c.RenderError(fmt.Errorf("chapter id not found (%v)", id))
	}

	document := data.Document{Id: chapter.Doc}
	var mDoc manipulator.Document
	if has, err := mDoc.Get(&document); err != nil {
		return c.RenderError(err)
	} else if !has {
		return c.RenderError(fmt.Errorf("document id not found (%v)", chapter.Doc))
	}

	var panels []data.Panel
	var mPanel manipulator.Panel
	if err := mPanel.Find(id, &panels); err != nil {
		return c.RenderError(err)
	}

	return c.Render(document, chapter, panels)
}
func (c App) Chapter(id int64) revel.Result {
	if id == 0 {
		return c.RenderError(errors.New("chapter id not found (0)"))
	}
	chapter := data.Chapter{Id: id}
	var mChapter manipulator.Chapter
	if has, err := mChapter.Get(&chapter); err != nil {
		return c.RenderError(err)
	} else if !has {
		return c.RenderError(fmt.Errorf("chapter id not found (%v)", id))
	}

	document := data.Document{Id: chapter.Doc}
	var mDoc manipulator.Document
	if has, err := mDoc.Get(&document); err != nil {
		return c.RenderError(err)
	} else if !has {
		return c.RenderError(fmt.Errorf("document id not found (%v)", chapter.Doc))
	}

	var panels []data.Panel
	var mPanel manipulator.Panel
	if err := mPanel.Find(id, &panels); err != nil {
		return c.RenderError(err)
	}

	return c.Render(document, chapter, panels)
}
func (c App) Document(id int64) revel.Result {
	return c.Render()
}
