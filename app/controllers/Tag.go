package controllers

import (
	"encoding/json"
	"fmt"
	"github.com/revel/revel"
	"king-document-build/app/modules/ajax"
	"king-document-build/app/modules/db/data"
	"king-document-build/app/modules/db/manipulator"
)

type Tag struct {
	*revel.Controller
}

func (this Tag) Admin() revel.Result {
	var tags []data.Tag
	var mTag manipulator.Tag
	err := mTag.Find(&tags)
	if err != nil {
		return this.RenderError(err)
	}
	return this.Render(tags)
}
func (this Tag) AjaxCreate(pid int64, name string) revel.Result {
	var result ajax.Result

	tag := data.Tag{Pid: pid, Name: name}
	var mTag manipulator.Tag
	err := mTag.New(&tag)
	if err == nil {
		result.Value = tag.Id
		result.Str = fmt.Sprint(tag.Sort)
	} else {
		result.Code = ajax.CODE_ERROR
		result.Emsg = err.Error()
	}
	return this.RenderJSON(&result)
}
func (this Tag) AjaxRename(id int64, name string) revel.Result {
	var result ajax.Result
	tag := data.Tag{Id: id, Name: name}
	var mTag manipulator.Tag
	err := mTag.Rename(&tag)
	if err != nil {
		result.Code = ajax.CODE_ERROR
		result.Emsg = err.Error()
	}
	return this.RenderJSON(&result)
}
func (this Tag) AjaxMove(id, pid int64) revel.Result {
	var result ajax.Result
	var mTag manipulator.Tag
	err := mTag.Move(id, pid)
	if err != nil {
		result.Code = ajax.CODE_ERROR
		result.Emsg = err.Error()
	}
	return this.RenderJSON(&result)
}
func (this Tag) AjaxRemove(id int64) revel.Result {
	var result ajax.Result
	var mTag manipulator.Tag
	err := mTag.Remove(id)
	if err != nil {
		result.Code = ajax.CODE_ERROR
		result.Emsg = err.Error()
	}
	return this.RenderJSON(&result)
}
func (this Tag) AjaxSort(str string) revel.Result {
	var result ajax.Result

	var sorts []data.Sort
	err := json.Unmarshal([]byte(str), &sorts)
	if err != nil {
		result.Code = ajax.CODE_ERROR
		result.Emsg = err.Error()
		return this.RenderJSON(&result)
	}

	var mTag manipulator.Tag
	err = mTag.Sort(sorts)
	if err != nil {
		result.Code = ajax.CODE_ERROR
		result.Emsg = err.Error()
	}
	return this.RenderJSON(&result)
}
func (this Tag) AjaxGetDocs(tag int64) revel.Result {
	var result ajax.ResultDocs
	var mDoc manipulator.Document
	if err := mDoc.FindByTag(tag, &result.Data); err != nil {
		result.Code = ajax.CODE_ERROR
		result.Emsg = err.Error()
	}

	return this.RenderJSON(&result)
}
