package manipulator

import (
	"fmt"
	"github.com/go-xorm/xorm"
	"king-document-build/app/modules/db/data"
	"os"
)

type Document struct {
}

func (d *Document) New(bean *data.Document) error {
	session := NewSession()
	defer session.Close()
	err := session.Begin()
	defer func() {
		if err == nil {
			session.Commit()
		} else {
			session.Rollback()
		}
	}()
	var has bool
	var tag data.Tag
	if bean.Tag != 0 {
		if has, err = session.Id(bean.Tag).Get(&tag); err != nil {
			return err
		} else if !has {
			err = fmt.Errorf("tag id not found (%v)", bean.Tag)
			return err
		}
	}
	bean.Sort, _ = session.Count(data.Document{Tag: bean.Tag})

	if _, err = session.InsertOne(bean); err != nil {
		return err
	}

	if tag.Id != 0 {
		docs := tag.Docs + 1
		if _, err = session.Id(tag.Id).Update(data.Tag{Docs: docs}); err != nil {
			return nil
		}

	}
	return nil

}

func (d *Document) Get(bean *data.Document) (bool, error) {
	return GetEngine().Get(bean)
}
func (d *Document) Modify(bean *data.Document) error {
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

	var doc data.Document
	var has bool
	if has, err = session.Id(bean.Id).Get(&doc); err != nil {
		return err
	} else if !has {
		err = fmt.Errorf("document id not found (%v)", bean.Id)
		return err
	}
	if doc.Tag != bean.Tag {
		//tag --
		if doc.Tag != 0 {
			var tag data.Tag
			id := doc.Tag
			if has, err = session.Id(id).Get(&tag); err != nil {
				return err
			} else if !has {
				err = fmt.Errorf("tag id not found (%v)", id)
				return err
			}
			if tag.Docs > 0 {
				tag.Docs--
			}
			if _, err = session.Id(id).MustCols("docs").Update(&tag); err != nil {
				return err
			}
		}

		//tag ++
		if bean.Tag != 0 {
			var tag data.Tag
			id := bean.Tag
			if has, err = session.Id(id).Get(&tag); err != nil {
				return err
			} else if !has {
				err = fmt.Errorf("tag id not found (%v)", id)
				return err
			}
			tag.Docs++
			if _, err = session.Id(id).MustCols("docs").Update(&tag); err != nil {
				return err
			}
		}
	}

	//update
	_, err = session.Id(bean.Id).MustCols("name", "tag").Update(bean)
	return err
}

func (d *Document) Count(tag int64) (int64, error) {
	return GetEngine().Where("tag = ?", tag).Count(data.Document{})
}

func (d *Document) FindByTag(tag int64, beans *[]data.Document) error {
	return GetEngine().OrderBy("sort").Where("tag = ?", tag).Find(beans)
}
func (d *Document) Remove3(session *xorm.Session, id int64, strs *[]string) error {
	var chapters []data.Chapter
	err := session.Where("doc = ?", id).Find(&chapters)
	if err != nil {
		return err
	}
	var mChapter Chapter
	for i := 0; i < len(chapters); i++ {
		if err = mChapter.Remove3(session, chapters[i].Id, strs); err != nil {
			return err
		}
	}

	var doc data.Document
	if has, err := session.Id(id).Get(&doc); err != nil {
		return err
	} else if !has {
		return nil
	}

	var tag data.Tag
	if _, err = session.Id(doc.Tag).Get(&tag); err != nil {
		return fmt.Errorf("tag id not found (%v)", doc.Tag)
	}
	if tag.Docs > 0 {
		tag.Docs--
		if _, err = session.Id(doc.Tag).Update(&tag); err != nil {
			return err
		}
	}

	_, err = session.Id(id).Delete(data.Document{})

	return err
}
func (d *Document) Remove(id int64) error {
	session := NewSession()
	defer session.Close()
	err := session.Begin()
	if err != nil {
		return err
	}
	strs := make([]string, 0, 100)
	defer func() {
		if err == nil {
			for _, str := range strs {
				os.Remove(str + ".txt")
				os.RemoveAll(str)
			}
			session.Commit()
		} else {
			session.Rollback()
		}
	}()
	err = d.Remove3(session, id, &strs)
	return err
}
func (d *Document) Sort(ids []int64) error {
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

	n := int64(0)
	for _, id := range ids {
		if _, err = session.Id(id).Cols("sort").Update(data.Document{Sort: n}); err != nil {
			return err
		}
		n++
	}

	return nil
}
