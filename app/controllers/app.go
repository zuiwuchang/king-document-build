package controllers

import (
	"errors"
	"fmt"
	"github.com/revel/revel"
	"king-document-build/app/modules/db/data"
	"king-document-build/app/modules/db/manipulator"
)

type App struct {
	*revel.Controller
}

/*func (this App) Index() revel.Result {
	return this.Render()
}*/
func (this App) Contact() revel.Result {
	return this.Render()
}
func (this App) License() revel.Result {
	license := manipulator.GetLicense()
	return this.Render(license)
}
func (this App) About() revel.Result {
	return this.Render()
}

func (this App) Search() revel.Result {
	var tags []data.Tag
	var mTag manipulator.Tag
	err := mTag.Find(&tags)
	if err != nil {
		return this.RenderError(err)
	}

	var mDocunemt manipulator.Document
	var rows int64
	rows, err = mDocunemt.Count(0)
	if err != nil {
		return this.RenderError(err)
	}
	return this.Render(tags, rows)
}

func (this App) Edit(id int64) revel.Result {
	if id == 0 {
		return this.RenderError(errors.New("chapter id not found (0)"))
	}
	chapter := data.Chapter{Id: id}
	var mChapter manipulator.Chapter
	if has, err := mChapter.Get(&chapter); err != nil {
		return this.RenderError(err)
	} else if !has {
		return this.RenderError(fmt.Errorf("chapter id not found (%v)", id))
	}

	document := data.Document{Id: chapter.Doc}
	var mDoc manipulator.Document
	if has, err := mDoc.Get(&document); err != nil {
		return this.RenderError(err)
	} else if !has {
		return this.RenderError(fmt.Errorf("document id not found (%v)", chapter.Doc))
	}

	var panels []data.PanelEx
	var mPanel manipulator.Panel
	if err := mPanel.FindEx(id, &panels); err != nil {
		return this.RenderError(err)
	}

	return this.Render(document, chapter, panels)
}
func (this App) Chapter(id int64) revel.Result {
	if id == 0 {
		return this.RenderError(errors.New("chapter id not found (0)"))
	}
	chapter := data.Chapter{Id: id}
	var mChapter manipulator.Chapter
	if has, err := mChapter.Get(&chapter); err != nil {
		return this.RenderError(err)
	} else if !has {
		return this.RenderError(fmt.Errorf("chapter id not found (%v)", id))
	}

	document := data.Document{Id: chapter.Doc}
	var mDoc manipulator.Document
	if has, err := mDoc.Get(&document); err != nil {
		return this.RenderError(err)
	} else if !has {
		return this.RenderError(fmt.Errorf("document id not found (%v)", chapter.Doc))
	}

	var panels []data.PanelEx
	var mPanel manipulator.Panel
	if err := mPanel.FindEx(id, &panels); err != nil {
		return this.RenderError(err)
	}

	return this.Render(document, chapter, panels)
}
func (this App) Document(id int64) revel.Result {
	return this.Render()
}
func (this App) Login() revel.Result {
	if pwd, ok := this.Session["pwd"]; ok && pwd == manipulator.GetPwd() {
		return this.Redirect("/")
	}
	return this.Render()
}
func (this App) Out() revel.Result {
	for k, _ := range this.Session {
		delete(this.Session, k)
	}

	return this.Redirect("/")
}
func (this App) DoLogin(kingDocBuildPwd string) revel.Result {
	if kingDocBuildPwd == manipulator.GetPwd() {
		this.Session["pwd"] = kingDocBuildPwd
		return this.Redirect("/")
	}
	delete(this.Session, "pwd")

	this.Flash.Out["e"] = "yes"
	return this.Redirect("/App/Login")
}
