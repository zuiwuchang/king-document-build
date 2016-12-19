package controllers

import (
	"github.com/revel/revel"
	"modules/ajax"
	"modules/db/data"
	"modules/db/manipulator"
)

type Panel struct {
	*revel.Controller
}

func (c Panel) AjaxNew(name string, chapter int64) revel.Result {
	var result ajax.Result
	if chapter == 0 {
		result.Code = ajax.CODE_ERROR
		result.Emsg = "chapter id not found (0)"
		return c.RenderJson(result)
	}
	var mPanel manipulator.Panel
	bean := data.Panel{Name: name, Chapter: chapter}
	if err := mPanel.New(&bean); err == nil {
		result.Value = bean.Id
	} else {
		result.Code = ajax.CODE_ERROR
		result.Emsg = err.Error()
	}
	return c.RenderJson(result)
}
