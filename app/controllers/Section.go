package controllers

import (
	"github.com/revel/revel"
	"modules/ajax"
	"modules/db/data"
	"modules/db/manipulator"
)

type Section struct {
	*revel.Controller
}

func (c Section) AjaxNew(panel int64, name string) revel.Result {
	var result ajax.Result
	if panel == 0 {
		result.Code = ajax.CODE_ERROR
		result.Emsg = "panel id not found (0)"
		return c.RenderJson(result)
	}
	var mSection manipulator.Section
	bean := data.Section{Name: name, Panel: panel}
	if err := mSection.New(&bean); err == nil {
		result.Value = bean.Id
	} else {
		result.Code = ajax.CODE_ERROR
		result.Emsg = err.Error()
	}
	return c.RenderJson(result)
}
func (c Section) AjaxFind(panel int64) revel.Result {
	var result ajax.ResultSections
	if panel == 0 {
		result.Code = ajax.CODE_ERROR
		result.Emsg = "panel id not found (0)"
		return c.RenderJson(result)
	}
	var mSection manipulator.Section
	if err := mSection.Find(panel, &result.Data); err != nil {
		result.Code = ajax.CODE_ERROR
		result.Emsg = err.Error()
	}
	rows := len(result.Data)
	for i := 0; i < rows; i++ {
		mSection.Read(&(result.Data[i]))
	}

	return c.RenderJson(result)
}
func (c Section) AjaxSave(id int64, val string) revel.Result {
	var result ajax.Result
	if id == 0 {
		result.Code = ajax.CODE_ERROR
		result.Emsg = "section id not found (0)"
		return c.RenderJson(result)
	}

	var mSection manipulator.Section
	if err := mSection.Save(id, val); err != nil {
		result.Code = ajax.CODE_ERROR
		result.Emsg = err.Error()
		return c.RenderJson(result)
	}

	return c.RenderJson(result)
}
