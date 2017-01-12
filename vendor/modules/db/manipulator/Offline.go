package manipulator

import (
	"archive/tar"
	"compress/gzip"
	"encoding/json"
	"fmt"
	"github.com/go-xorm/xorm"
	"io/ioutil"
	"modules/db/data"
	"os"
)

type Offline struct {
}

func (o *Offline) Create(str string) error {
	session := NewSession()
	defer session.Close()
	err := session.Begin()
	if err != nil {
		return err
	}
	defer session.Commit()

	//創建 tar 檔案 io.Writer
	var file *os.File
	file, err = os.Create(str)
	if err != nil {
		return err
	}
	defer file.Close()

	//創建 gzip writer
	gw := gzip.NewWriter(file)
	defer gw.Close()

	//創建 tar writer
	tw := tar.NewWriter(gw)
	defer tw.Close()

	if err = o.createTags(session, tw); err != nil {
		return err
	}
	if err = o.createDocs(session, tw); err != nil {
		return err
	}
	if err = o.createChapters(session, tw); err != nil {
		return err
	}
	if err = o.createPanels(session, tw); err != nil {
		return err
	}
	if err = o.createSections(session, tw); err != nil {
		return err
	}
	return nil
}
func (o *Offline) writeTar(tw *tar.Writer, name string, v interface{}) error {
	//b, err := json.Marshal(v)
	b, err := json.MarshalIndent(v, "	", "	")
	if err != nil {
		return err
	}
	str := "var __v="

	size := int64(len(b) + len(str))
	hdr := &tar.Header{
		Name: name,
		Mode: 0600,
		Size: size,
	}
	//寫入 header
	if err = tw.WriteHeader(hdr); err != nil {
		return err
	}
	//寫入 body
	if _, err = tw.Write([]byte(str)); err != nil {
		return err
	}
	if _, err = tw.Write(b); err != nil {
		return err
	}

	return nil
}
func (o *Offline) readFile(path string, v interface{}) error {
	b, e := ioutil.ReadFile(path)
	if e != nil {
		return e
	}
	n := len("var __v=")
	if len(b) < n+2 {
		return fmt.Errorf("%v format error", path)
	}
	b = b[n:]
	return json.Unmarshal(b, v)

}
func (o *Offline) createTags(session *xorm.Session, tw *tar.Writer) error {
	//tags
	var tags []data.Tag
	err := session.Find(&tags)
	if err != nil {
		return err
	}
	//tag 0
	count, err := session.Where("tag = 0").Count(data.Document{})
	if err != nil {
		return err
	}
	tags = append(tags, data.Tag{Id: 0, Docs: count})

	//tar
	if err = o.writeTar(tw, "data/tags.js", tags); err != nil {
		return err
	}

	//寫入 Document
	for _, tag := range tags {
		if err = o.createTag(session, tw, tag.Id); err != nil {
			return err
		}
	}
	return nil
}
func (o *Offline) createTag(session *xorm.Session, tw *tar.Writer, tag int64) error {
	var docs []data.Document
	err := session.Where("tag = ?", tag).Find(&docs)
	if err != nil {
		return err
	}

	//tar
	name := fmt.Sprintf("data/tags/%v.js", tag)
	if err = o.writeTar(tw, name, docs); err != nil {
		return err
	}
	return nil
}

func (o *Offline) createDocs(session *xorm.Session, tw *tar.Writer) error {
	//docs
	var docs []data.Document
	err := session.Find(&docs)
	if err != nil {
		return err
	}

	maps := make(map[int64]data.Document)
	for _, doc := range docs {
		maps[doc.Id] = doc
	}

	//tar
	if err = o.writeTar(tw, "data/docs.js", maps); err != nil {
		return err
	}

	//寫入 Chapter
	for _, doc := range docs {
		if err = o.createDoc(session, tw, doc.Id); err != nil {
			return err
		}
	}
	return nil
}
func (o *Offline) createDoc(session *xorm.Session, tw *tar.Writer, doc int64) error {
	var chapters []data.Chapter
	err := session.Where("doc = ?", doc).OrderBy("sort").Find(&chapters)
	if err != nil {
		return err
	}

	//tar
	name := fmt.Sprintf("data/docs/%v.js", doc)
	if err = o.writeTar(tw, name, chapters); err != nil {
		return err
	}
	return nil
}
func (o *Offline) createChapters(session *xorm.Session, tw *tar.Writer) error {
	//chapters
	var chapters []data.Chapter
	err := session.Find(&chapters)
	if err != nil {
		return err
	}

	maps := make(map[int64]data.Chapter)
	for _, chapter := range chapters {
		maps[chapter.Id] = chapter
	}

	//tar
	if err = o.writeTar(tw, "data/chapters.js", maps); err != nil {
		return err
	}

	//寫入 Panel
	for _, chapter := range chapters {
		if err = o.createChapter(session, tw, chapter.Id); err != nil {
			return err
		}
	}
	return nil
}
func (o *Offline) createChapter(session *xorm.Session, tw *tar.Writer, chapter int64) error {
	var panels []data.Panel
	err := session.Where("chapter = ?", chapter).Desc("sort").Find(&panels)
	if err != nil {
		return err
	}

	//tar
	name := fmt.Sprintf("data/chapters/%v.js", chapter)
	if err = o.writeTar(tw, name, panels); err != nil {
		return err
	}
	return nil
}
func (o *Offline) createPanels(session *xorm.Session, tw *tar.Writer) error {
	//panels
	var panels []data.Panel
	err := session.Find(&panels)
	if err != nil {
		return err
	}

	maps := make(map[int64]data.Panel)
	for _, panel := range panels {
		maps[panel.Id] = panel
	}

	//tar
	if err = o.writeTar(tw, "data/panels.js", maps); err != nil {
		return err
	}

	//寫入 Section
	for _, panel := range panels {
		if err = o.createPanel(session, tw, panel.Id); err != nil {
			return err
		}
	}
	return nil
}
func (o *Offline) createPanel(session *xorm.Session, tw *tar.Writer, panel int64) error {
	var sections []data.Section
	err := session.Where("panel = ?", panel).Desc("sort").Find(&sections)
	if err != nil {
		return err
	}

	//tar
	name := fmt.Sprintf("data/panels/%v.js", panel)
	if err = o.writeTar(tw, name, sections); err != nil {
		return err
	}
	return nil
}
func (o *Offline) createSections(session *xorm.Session, tw *tar.Writer) error {
	//sections
	var sections []data.Section
	err := session.Find(&sections)
	if err != nil {
		return err
	}

	//tar
	if err = o.writeTar(tw, "data/sections.js", sections); err != nil {
		return err
	}
	return nil
}
func (o *Offline) Restore() error {
	session := NewSession()
	defer session.Close()
	err := session.Begin()
	if err != nil {
		return err
	}
	defer func() {
		if err == nil {
			session.Commit()
		} else {
			session.Rollback()
		}
	}()

	if err = o.restoreTags(session); err != nil {
		return err
	}
	if err = o.restoreDocs(session); err != nil {
		return err
	}
	if err = o.restoreChapters(session); err != nil {
		return err
	}
	if err = o.restorePanels(session); err != nil {
		return err
	}
	if err = o.restoreSections(session); err != nil {
		return err
	}
	return nil
}
func (o *Offline) restoreTags(session *xorm.Session) error {
	path := GetRootPath() + "/data/tags.js"
	var tags []data.Tag
	if err := o.readFile(path, &tags); err != nil {
		return err
	}

	if _, err := session.Exec("delete from tag"); err != nil {
		return err
	}

	for i := 0; i < len(tags); i++ {
		if tags[i].Id == 0 {
			continue
		}
		if _, err := session.InsertOne(&tags[i]); err != nil {
			return err
		}
	}
	return nil
}
func (o *Offline) restoreDocs(session *xorm.Session) error {
	path := GetRootPath() + "/data/docs.js"
	var docs map[int64]data.Document
	if err := o.readFile(path, &docs); err != nil {
		return err
	}

	if _, err := session.Exec("delete from document"); err != nil {
		return err
	}

	for _, doc := range docs {
		if _, err := session.InsertOne(&doc); err != nil {
			return err
		}
	}
	return nil
}
func (o *Offline) restoreChapters(session *xorm.Session) error {
	path := GetRootPath() + "/data/chapters.js"
	var chapters map[int64]data.Chapter
	if err := o.readFile(path, &chapters); err != nil {
		return err
	}

	if _, err := session.Exec("delete from chapter"); err != nil {
		return err
	}

	for _, chapter := range chapters {
		if _, err := session.InsertOne(&chapter); err != nil {
			return err
		}
	}
	return nil
}
func (o *Offline) restorePanels(session *xorm.Session) error {
	path := GetRootPath() + "/data/panels.js"
	var panels map[int64]data.Panel
	if err := o.readFile(path, &panels); err != nil {
		return err
	}

	if _, err := session.Exec("delete from panel"); err != nil {
		return err
	}

	for _, panel := range panels {
		if _, err := session.InsertOne(&panel); err != nil {
			return err
		}
	}
	return nil
}
func (o *Offline) restoreSections(session *xorm.Session) error {
	path := GetRootPath() + "/data/sections.js"
	var sections []data.Section
	if err := o.readFile(path, &sections); err != nil {
		return err
	}

	if _, err := session.Exec("delete from section"); err != nil {
		return err
	}

	for i := 0; i < len(sections); i++ {
		if _, err := session.InsertOne(&sections[i]); err != nil {
			return err
		}
	}
	return nil
}
