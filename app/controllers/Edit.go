package controllers

import (
	"fmt"
	"github.com/revel/revel"
	"modules/ajax"
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
func (c Edit) AjaxModifyDoc(id, tag int64, name string) revel.Result {
	var result ajax.Result
	doc := data.Document{Id: id, Tag: tag, Name: name}
	var mDocument manipulator.Document
	err := mDocument.Modify(&doc)
	if err != nil {
		result.Code = ajax.CODE_ERROR
		result.Emsg = err.Error()
	}
	return c.RenderJson(result)
}
func (c Edit) AjaxNewChapter(name string, doc int64) revel.Result {
	var result ajax.Result
	if doc == 0 {
		result.Code = ajax.CODE_ERROR
		result.Emsg = "doc id not found (0)"
		return c.RenderJson(result)
	}
	var mChapter manipulator.Chapter
	bean := data.Chapter{Name: name, Doc: doc}
	if err := mChapter.New(&bean); err == nil {
		result.Value = bean.Id
	} else {
		result.Code = ajax.CODE_ERROR
		result.Emsg = err.Error()
	}
	return c.RenderJson(result)
}
