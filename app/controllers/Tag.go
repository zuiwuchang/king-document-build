package controllers

import (
	"encoding/json"
	"github.com/revel/revel"
	"modules/ajax"
	"modules/db/data"
	"modules/db/manipulator"
)

type Tag struct {
	*revel.Controller
}

func (c Tag) Admin() revel.Result {
	var tags []data.Tag
	var mTag manipulator.Tag
	err := mTag.Find(&tags)
	if err != nil {
		return c.RenderError(err)
	}
	return c.Render(tags)
}
func (c Tag) AjaxCreate(pid, sort int64, name string) revel.Result {
	var result ajax.Result

	tag := data.Tag{Pid: pid, Sort: sort, Name: name}
	var mTag manipulator.Tag
	err := mTag.New(&tag)
	if err == nil {
		result.Value = tag.Id
	} else {
		result.Code = ajax.CODE_ERROR
		result.Emsg = err.Error()
	}
	return c.RenderJson(result)
}
func (c Tag) AjaxRename(id int64, name string) revel.Result {
	var result ajax.Result
	tag := data.Tag{Id: id, Name: name}
	var mTag manipulator.Tag
	err := mTag.Rename(&tag)
	if err != nil {
		result.Code = ajax.CODE_ERROR
		result.Emsg = err.Error()
	}
	return c.RenderJson(result)
}
func (c Tag) AjaxMove(id, pid int64) revel.Result {
	var result ajax.Result
	var mTag manipulator.Tag
	err := mTag.Move(id, pid)
	if err != nil {
		result.Code = ajax.CODE_ERROR
		result.Emsg = err.Error()
	}
	return c.RenderJson(result)
}
func (c Tag) AjaxRemove(id int64) revel.Result {
	var result ajax.Result
	var mTag manipulator.Tag
	err := mTag.Remove(id)
	if err != nil {
		result.Code = ajax.CODE_ERROR
		result.Emsg = err.Error()
	}
	return c.RenderJson(result)
}
func (c Tag) AjaxSort(str string) revel.Result {
	var result ajax.Result

	var sorts []data.Sort
	err := json.Unmarshal([]byte(str), &sorts)
	if err != nil {
		result.Code = ajax.CODE_ERROR
		result.Emsg = err.Error()
		return c.RenderJson(result)
	}

	var mTag manipulator.Tag
	err = mTag.Sort(sorts)
	if err != nil {
		result.Code = ajax.CODE_ERROR
		result.Emsg = err.Error()
	}
	return c.RenderJson(result)
}
func (c Tag) AjaxGetDocs(tag int64) revel.Result {
	var result ajax.ResultDocs
	var mDoc manipulator.Document
	if err := mDoc.FindByTag(tag, &result.Data); err != nil {
		result.Code = ajax.CODE_ERROR
		result.Emsg = err.Error()
	}

	return c.RenderJson(result)
}
