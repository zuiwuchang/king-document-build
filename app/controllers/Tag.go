package controllers

import (
	"github.com/revel/revel"
	"king-document-build/app/modules/ajax"
	"king-document-build/app/modules/db/data"
	"king-document-build/app/modules/db/manipulator"
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
func (c Tag) AjaxCreate(pid int64, name string) revel.Result {
	var result ajax.Result

	tag := data.Tag{Pid: pid, Name: name}
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
