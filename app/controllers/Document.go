package controllers

import (
	"fmt"
	"github.com/revel/revel"
	"king-document-build/app/modules/ajax"
	"king-document-build/app/modules/db/data"
	"king-document-build/app/modules/db/manipulator"
	"strconv"
	"strings"
)

type Document struct {
	*revel.Controller
}

func (this Document) Index(id int64) revel.Result {
	if id == 0 {
		return this.RenderError(fmt.Errorf("document id not found (%v)", id))
	}
	document := data.Document{Id: id}
	var mDocument manipulator.Document
	if has, err := mDocument.Get(&document); err != nil {
		return this.RenderError(err)
	} else if !has {
		return this.RenderError(fmt.Errorf("document id not found (%v)", id))
	}

	var mChapter manipulator.Chapter
	var chapters []data.Chapter
	if err := mChapter.FindByDoc(id, &chapters); err != nil {
		return this.RenderError(err)
	}

	var tags []data.Tag
	var mTag manipulator.Tag
	if document.Tag != 0 {
		if err := mTag.FindPath(document.Tag, &tags); err != nil {
			return this.RenderError(err)
		}
	}

	return this.Render(document, chapters, tags)
}
func (this Document) New() revel.Result {
	var name, tag string
	errMsg, ok := this.Session["errNew"]
	if ok {
		delete(this.Session, "errNew")

		if name, ok = this.Session["errValName"]; ok {
			delete(this.Session, "errValName")
		}
		if tag, ok = this.Session["errValTag"]; ok {
			delete(this.Session, "errValTag")
		}
	}

	var tags []data.Tag
	var mTag manipulator.Tag
	err := mTag.Find(&tags)
	if err != nil {
		return this.RenderError(err)
	}
	return this.Render(tags, errMsg, name, tag)
}

func (this Document) NewDoc(name, tag string) revel.Result {
	doc := data.Document{Name: name}
	doc.Tag, _ = strconv.ParseInt(tag, 10, 64)
	var mDocument manipulator.Document
	err := mDocument.New(&doc)
	if err == nil {
		return this.Redirect(fmt.Sprintf("/Document/Edit?id=%v", doc.Id))
	}
	this.Session["errNew"] = "1"
	this.Session["errValName"] = name
	this.Session["errValTag"] = tag
	return this.Redirect(Document.New)
}
func (this Document) Edit(id int64) revel.Result {
	if id == 0 {
		return this.RenderError(fmt.Errorf("document id not found (%v)", id))
	}
	document := data.Document{Id: id}
	var mDocument manipulator.Document
	if has, err := mDocument.Get(&document); err != nil {
		return this.RenderError(err)
	} else if !has {
		return this.RenderError(fmt.Errorf("document id not found (%v)", id))
	}

	var mChapter manipulator.Chapter
	var chapters []data.Chapter
	if err := mChapter.FindByDoc(id, &chapters); err != nil {
		return this.RenderError(err)
	}

	var tags []data.Tag
	var mTag manipulator.Tag
	err := mTag.Find(&tags)
	if err != nil {
		return this.RenderError(err)
	}
	return this.Render(document, tags, chapters, id)
}
func (this Document) AjaxModify(id, tag int64, name string) revel.Result {
	var result ajax.Result
	doc := data.Document{Id: id, Tag: tag, Name: name}
	var mDocument manipulator.Document
	err := mDocument.Modify(&doc)
	if err != nil {
		result.Code = ajax.CODE_ERROR
		result.Emsg = err.Error()
	}
	return this.RenderJSON(&result)
}
func (this Document) AjaxRemove(id int64) revel.Result {
	var result ajax.Result

	if id == 0 {
		result.Code = ajax.CODE_ERROR
		result.Emsg = "document id not found (0)"
		return this.RenderJSON(&result)
	}
	var mDocument manipulator.Document
	if err := mDocument.Remove(id); err != nil {
		result.Code = ajax.CODE_ERROR
		result.Emsg = err.Error()
		return this.RenderJSON(&result)
	}

	return this.RenderJSON(&result)
}
func (this Document) AjaxSort(sort string) revel.Result {
	var result ajax.Result

	strs := strings.Split(sort, "-")
	ids := make([]int64, 0, len(strs))
	for _, str := range strs {
		str := strings.TrimSpace(str)
		if str == "" {
			continue
		}
		if id, err := strconv.ParseInt(str, 10, 64); err != nil {
			result.Code = ajax.CODE_ERROR
			result.Emsg = err.Error()
			return this.RenderJSON(&result)
		} else if id == 0 {
			result.Code = ajax.CODE_ERROR
			result.Emsg = "document id not found (0)"
			return this.RenderJSON(&result)
		} else {
			ids = append(ids, id)
		}
	}
	if len(ids) == 0 {
		result.Code = ajax.CODE_ERROR
		result.Emsg = "document sort cann't be empty"
		return this.RenderJSON(&result)
	}
	var mDocument manipulator.Document
	if err := mDocument.Sort(ids); err != nil {
		result.Code = ajax.CODE_ERROR
		result.Emsg = err.Error()
		return this.RenderJSON(&result)
	}

	return this.RenderJSON(&result)
}
