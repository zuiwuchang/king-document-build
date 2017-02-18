package controllers

import (
	"encoding/json"
	"fmt"
	"github.com/revel/revel"
	"king-document-build/app/modules/ajax"
	"king-document-build/app/modules/db/data"
	"king-document-build/app/modules/db/manipulator"
)

type Chapter struct {
	*revel.Controller
}

func (c Chapter) AjaxRename(id int64, name string) revel.Result {
	var result ajax.Result
	bean := data.Chapter{Id: id, Name: name}
	var mChapter manipulator.Chapter
	err := mChapter.Rename(&bean)
	if err != nil {
		result.Code = ajax.CODE_ERROR
		result.Emsg = err.Error()
	}
	return c.RenderJson(result)
}
func (c Chapter) AjaxSort(str string) revel.Result {
	var result ajax.Result

	var sorts []data.Sort
	err := json.Unmarshal([]byte(str), &sorts)
	if err != nil {
		result.Code = ajax.CODE_ERROR
		result.Emsg = err.Error()
		return c.RenderJson(result)
	}

	var mChapter manipulator.Chapter
	err = mChapter.Sort(sorts)
	if err != nil {
		result.Code = ajax.CODE_ERROR
		result.Emsg = err.Error()
	}
	return c.RenderJson(result)
}
func (c Chapter) AjaxNew(name string, doc int64) revel.Result {
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
		result.Str = fmt.Sprint(bean.Sort)
	} else {
		result.Code = ajax.CODE_ERROR
		result.Emsg = err.Error()
	}
	return c.RenderJson(result)
}
func (c Chapter) AjaxRemove(id int64) revel.Result {
	var result ajax.Result

	if id == 0 {
		result.Code = ajax.CODE_ERROR
		result.Emsg = "chapter id not found (0)"
		return c.RenderJson(result)
	}
	var mChapter manipulator.Chapter
	if err := mChapter.Remove(id); err != nil {
		result.Code = ajax.CODE_ERROR
		result.Emsg = err.Error()
		return c.RenderJson(result)
	}

	return c.RenderJson(result)
}
