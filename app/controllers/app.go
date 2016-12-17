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
		//return c.RenderError(fmt.Errorf("document id not found (%v)", id))
		id = 1
	}
	document := data.Document{Id: id}
	var mDocument manipulator.Document
	if has, err := mDocument.Get(&document); err != nil {
		return c.RenderError(err)
	} else if !has {
		return c.RenderError(fmt.Errorf("document id not found (%v)", id))
	}

	var tags []data.Tag
	var mTag manipulator.Tag
	err := mTag.Find(&tags)
	if err != nil {
		return c.RenderError(err)
	}
	return c.Render(document, tags)
}

func (c App) Document() revel.Result {
	return c.Render()
}
