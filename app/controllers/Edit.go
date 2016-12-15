package controllers

import (
	"github.com/revel/revel"
)

type Edit struct {
	*revel.Controller
}

func (c Edit) New() revel.Result {

	return c.Render()
}
