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
	return err
}
func (p *Panel) Find(chapter int64, beans *[]data.Panel) error {
	return GetEngine().Where("chapter = ?", chapter).Desc("Sort").Find(beans)
}
func (p *Panel) Rename(bean *data.Panel) error {
	if n, err := GetEngine().Id(bean.Id).MustCols("name").Update(bean); err != nil {
		return err
	} else if n == 0 {
		return fmt.Errorf("panel id not found (%v)", n)
	}
	return nil
}
func (p *Panel) Sort(ids []int64) error {
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

	n := int64(len(ids))
	var has bool
	for _, id := range ids {
		if has, err = session.Id(id).Cols("id").Get(&data.Panel{}); err != nil {
			return err
		} else if !has {
			return fmt.Errorf("panel id not found (%v)", id)
		}
		if _, err = session.Id(id).Update(data.Panel{Sort: n}); err != nil {
			return err
		}
		n--
	}

	return nil
}
