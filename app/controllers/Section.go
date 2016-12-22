package controllers

import (
	"github.com/revel/revel"
	"modules/ajax"
	"modules/db/data"
	"modules/db/manipulator"
	"strconv"
	"strings"
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
func (c Section) AjaxRename(id int64, name string) revel.Result {
	var result ajax.Result
	if id == 0 {
		result.Code = ajax.CODE_ERROR
		result.Emsg = "section id not found (0)"
		return c.RenderJson(result)
	}
	var mSection manipulator.Section
	bean := data.Section{Id: id, Name: name}
	if err := mSection.Rename(&bean); err != nil {
		result.Code = ajax.CODE_ERROR
		result.Emsg = err.Error()
	}
	return c.RenderJson(result)
}
func (c Section) AjaxSort(sort string) revel.Result {
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
			return c.RenderJson(result)
		} else if id == 0 {
			result.Code = ajax.CODE_ERROR
			result.Emsg = "section id not found (0)"
			return c.RenderJson(result)
		} else {
			ids = append(ids, id)
		}
	}
	if len(ids) == 0 {
		result.Code = ajax.CODE_ERROR
		result.Emsg = "section sort cann't be empty"
		return c.RenderJson(result)
	}
	var mSection manipulator.Section
	if err := mSection.Sort(ids); err != nil {
		result.Code = ajax.CODE_ERROR
		result.Emsg = err.Error()
		return c.RenderJson(result)
	}

	return c.RenderJson(result)
}
