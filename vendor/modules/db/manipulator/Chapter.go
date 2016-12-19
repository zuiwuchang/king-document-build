package manipulator

import (
	"fmt"
	"modules/db/data"
)

type Chapter struct {
}

func (c *Chapter) FindByDoc(id int64, beans *[]data.Chapter) error {
	return GetEngine().Where("doc = ?", id).Find(beans)
}
func (c *Chapter) New(bean *data.Chapter) error {
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
	if has, err = session.Id(bean.Doc).Get(&data.Document{}); err != nil {
		return err
	} else if !has {
		err = fmt.Errorf("doc id not found (%v)", bean.Doc)
		return err
	}

	_, err = session.InsertOne(bean)
	return nil
}
func (c *Chapter) Rename(bean *data.Chapter) error {
	engine := GetEngine()
	if rows, err := engine.Id(bean.Id).Update(data.Chapter{Name: bean.Name}); err != nil {
		return err
	} else if rows == 0 {
		return fmt.Errorf("chapter id not found (%v)", bean.Id)
	}
	return nil
}
func (c *Chapter) Sort(sorts []data.Sort) error {
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

	for _, sort := range sorts {
		if _, err := session.Id(sort.Id).MustCols("sort").Update(data.Chapter{Sort: sort.Sort}); err != nil {
			return err
		}
	}
	return nil
}
