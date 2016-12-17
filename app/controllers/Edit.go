package controllers

import (
	"fmt"
	"github.com/revel/revel"
	"modules/db/data"
	"modules/db/manipulator"
	"strconv"
)

type Edit struct {
	*revel.Controller
}

func (c Edit) New() revel.Result {
	var name, tag string
	errMsg, ok := c.Session["errNew"]
	if ok {
		delete(c.Session, "errNew")

		if name, ok = c.Session["errValName"]; ok {
			delete(c.Session, "errValName")
		}
		if tag, ok = c.Session["errValTag"]; ok {
			delete(c.Session, "errValTag")
		}
	}

	var tags []data.Tag
	var mTag manipulator.Tag
	err := mTag.Find(&tags)
	if err != nil {
		return c.RenderError(err)
	}
	return c.Render(tags, errMsg, name, tag)
}
func (c Edit) NewDoc(name, tag string) revel.Result {

	doc := data.Document{Name: name}
	doc.Tag, _ = strconv.ParseInt(tag, 10, 64)
	var mDocument manipulator.Document
	err := mDocument.New(&doc)
	if err == nil {
		return c.Redirect(fmt.Sprintf("/Edit?id=%v", doc.Id))
	}
	c.Session["errNew"] = "1"
	c.Session["errValName"] = name
	c.Session["errValTag"] = tag
	return c.Redirect(Edit.New)
}
