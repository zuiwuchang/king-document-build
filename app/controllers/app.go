package controllers

import (
	"github.com/revel/revel"
	"king-document-build/app/modules/crypto"
	"strings"
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
func (c App) Login() revel.Result {
	var err string
	var ok bool
	if err, ok = c.Session["errLogin"]; ok {
		delete(c.Session, "errLogin")
	}
	return c.Render(err)
}
func (c App) DoLogin(pwd string) revel.Result {
	str, _ := revel.Config.String("user.pwd")
	str = strings.TrimSpace(str)
	if str != "" {
		str = crypto.GetHash(str)
		if pwd != str {
			c.Session["errLogin"] = c.Message("err no pwd match")
			return c.Redirect(App.Login)
		}
	}

	c.Session["login"] = "1"
	return c.Redirect(App.Index)
}
func (c App) Logout() revel.Result {
	c.Session = make(map[string]string)
	return c.Redirect(App.Login)
}
