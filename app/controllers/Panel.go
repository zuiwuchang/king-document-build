package controllers

import (
	"github.com/revel/revel"
	"modules/ajax"
	"modules/db/data"
	"modules/db/manipulator"
	"strconv"
	"strings"
)

type Panel struct {
	*revel.Controller
}

func (c Panel) AjaxNew(chapter int64, name string) revel.Result {
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
func (c Panel) AjaxRename(id int64, name string) revel.Result {
	var result ajax.Result
	if id == 0 {
		result.Code = ajax.CODE_ERROR
		result.Emsg = "panel id not found (0)"
		return c.RenderJson(result)
	}
	var mPanel manipulator.Panel
	bean := data.Panel{Id: id, Name: name}
	if err := mPanel.Rename(&bean); err != nil {
		result.Code = ajax.CODE_ERROR
		result.Emsg = err.Error()
	}
	return c.RenderJson(result)
}
func (c Panel) AjaxSort(sort string) revel.Result {
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
			result.Emsg = "panel id not found (0)"
			return c.RenderJson(result)
		} else {
			ids = append(ids, id)
		}
	}
	if len(ids) == 0 {
		result.Code = ajax.CODE_ERROR
		result.Emsg = "panel sort cann't be empty"
		return c.RenderJson(result)
	}
	var mPanel manipulator.Panel
	if err := mPanel.Sort(ids); err != nil {
		result.Code = ajax.CODE_ERROR
		result.Emsg = err.Error()
		return c.RenderJson(result)
	}

	return c.RenderJson(result)
}
