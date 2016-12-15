package manipulator

import (
	"fmt"
	"king-document-build/app/modules/db/data"
)

type Tag struct {
}

func (t *Tag) Find(beans *[]data.Tag) error {
	engine := GetEngine()

	return engine.Find(beans)
}
func (t *Tag) New(bean *data.Tag) error {
	session := NewSession()
	defer session.Clone()

	var err error
	if err = session.Begin(); err != nil {
		return err
	}
	defer func() {
		if err == nil {
			session.Commit()
		} else {
			session.Rollback()
		}
	}()

	pid := bean.Pid
	if pid != 0 {
		var has bool
		if has, err = session.Id(pid).Get(&data.Tag{}); err != nil {
			return err
		} else if !has {
			return fmt.Errorf("tag pid not found (%v)", pid)
		}
	}

	_, err = session.InsertOne(bean)
	return nil
}
func (t *Tag) Rename(bean *data.Tag) error {
	engine := GetEngine()
	if rows, err := engine.Id(bean.Id).Update(data.Tag{Name: bean.Name}); err != nil {
		return err
	} else if rows == 0 {
		return fmt.Errorf("tag id not found (%v)", bean.Id)
	}
	return nil
}
