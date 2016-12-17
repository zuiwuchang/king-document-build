package manipulator

import (
	"fmt"
	"modules/db/data"
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
	if _, err = session.InsertOne(bean); err != nil {
		return err
	}
	dir := GetRootPath() + "/" + fmt.Sprint(bean.Id)
	if err = os.MkdirAll(dir, 0774); err != nil {
		return nil
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
	return nil
}
