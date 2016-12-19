package manipulator

import (
	"fmt"
	"modules/db/data"
)

type Panel struct {
}

func (p *Panel) New(bean *data.Panel) error {
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

	var has bool
	if has, err = session.Id(bean.Chapter).Get(&data.Chapter{}); err != nil {
		return err
	} else if !has {
		err = fmt.Errorf("chapter id not found (%v)", bean.Chapter)
		return err
	}

	_, err = session.InsertOne(bean)
	return nil
}
func (p *Panel) Find(chapter int64, beans *[]data.Panel) error {
	return GetEngine().Where("chapter = ?", chapter).Desc("Sort").Find(beans)
}
