package controllers

import (
	"fmt"
	"github.com/revel/revel"
	"modules/ajax"
	"modules/db/data"
	"modules/db/manipulator"
	"strconv"
)

type Document struct {
	*revel.Controller
}

func (c Document) Index(id int64) revel.Result {
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

	return c.Render(document, chapters)
}
func (c Document) New() revel.Result {
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

func (c Document) NewDoc(name, tag string) revel.Result {
	doc := data.Document{Name: name}
	doc.Tag, _ = strconv.ParseInt(tag, 10, 64)
	var mDocument manipulator.Document
	err := mDocument.New(&doc)
	if err == nil {
		return c.Redirect(fmt.Sprintf("/Document/Edit?id=%v", doc.Id))
	}
	c.Session["errNew"] = "1"
	c.Session["errValName"] = name
	c.Session["errValTag"] = tag
	return c.Redirect(Document.New)
}
func (c Document) Edit(id int64) revel.Result {
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
func (c Document) AjaxModify(id, tag int64, name string) revel.Result {
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
