package manipulator

import (
	"archive/tar"
	"compress/gzip"
	"encoding/json"
	"fmt"
	"github.com/go-xorm/xorm"
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
		return nil
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
	return nil
}
func (o *Offline) writeTar(tw *tar.Writer, name string, v interface{}) error {
	b, err := json.Marshal(v)
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
