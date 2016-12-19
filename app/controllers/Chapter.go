package controllers

import (
	"encoding/json"
	"github.com/revel/revel"
	"modules/ajax"
	"modules/db/data"
	"modules/db/manipulator"
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
