package controllers

import (
	"github.com/revel/revel"
)

type App struct {
	*revel.Controller
}

func (c App) Index() revel.Result {
	return c.Render()
}
func (c App) DownloadBrowse() revel.Result {
	return c.Render()
}
func (c App) About() revel.Result {
	return c.Render()
}
