package manipulator

import (
	"fmt"
	"github.com/go-xorm/xorm"
	"king-document-build/app/modules/db/data"
	"os"
)

type Chapter struct {
}

func (c *Chapter) Get(bean *data.Chapter) (bool, error) {
	return GetEngine().Get(bean)
}
func (c *Chapter) FindByDoc(id int64, beans *[]data.Chapter) error {
	return GetEngine().Where("doc = ?", id).OrderBy("sort").Find(beans)
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

	var max data.Chapter
	session.Select("max(sort) as sort").Get(&max)
	bean.Sort = max.Sort + 1

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
func (c *Chapter) Remove3(session *xorm.Session, id int64, strs *[]string) error {
	var panels []data.Panel
	err := session.Where("chapter = ?", id).Find(&panels)
	if err != nil {
		return err
	}
	var mPanel Panel
	for i := 0; i < len(panels); i++ {
		if err = mPanel.Remove3(session, panels[i].Id, strs); err != nil {
			return err
		}
	}
	_, err = session.Id(id).Delete(data.Chapter{})

	return err
}
func (c *Chapter) Remove(id int64) error {
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
	err = c.Remove3(session, id, &strs)
	return err
}
