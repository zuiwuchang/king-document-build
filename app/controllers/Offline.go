package controllers

import (
	"github.com/revel/revel"
	"king-document-build/app/modules/db/manipulator"
)

type Offline struct {
	*revel.Controller
}

func (c Offline) Index() revel.Result {
	path := manipulator.GetRootPath() + "/data.tar.gz"
	var mOffline manipulator.Offline
	if err := mOffline.Create(path); err != nil {
		return c.RenderError(err)
	}
	return c.Render(path)
}
func (c Offline) Restore() revel.Result {
	var mOffline manipulator.Offline
	if err := mOffline.Restore(); err != nil {
		return c.RenderError(err)
	}
	return c.Render()
}
