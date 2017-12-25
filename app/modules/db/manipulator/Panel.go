package manipulator

import (
	"fmt"
	"github.com/go-xorm/xorm"
	"king-document-build/app/modules/db/data"
	"os"
)

type Panel struct {
}

func (p *Panel) New(bean *data.Panel) error {
	session := NewSession()
	defer session.Close()

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
func (p *Panel) FindEx(chapter int64, beans *[]data.PanelEx) error {
	e := GetEngine().
		Where("chapter = ?", chapter).
		Desc("Sort").
		Find(beans)
	if e != nil {
		return e
	}
	var mSection Section
	for i := 0; i < len(*beans); i++ {
		e = mSection.FindEx((*beans)[i].Id, &((*beans)[i].Section))
		if e != nil {
			return e
		}
	}
	return nil
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
		if has, err = session.Id(id).Get(&data.Panel{}); err != nil {
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
func (p *Panel) Remove3(session *xorm.Session, id int64, strs *[]string) error {
	var sections []data.Section
	err := session.Where("panel = ?", id).Find(&sections)
	if err != nil {
		return err
	}
	var mSection Section
	for i := 0; i < len(sections); i++ {
		if err = mSection.Remove3(session, sections[i].Id, strs); err != nil {
			return err
		}
	}
	_, err = session.Id(id).Delete(data.Panel{})

	return err
}
func (p *Panel) Remove(id int64) error {
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
	err = p.Remove3(session, id, &strs)
	return err
}
