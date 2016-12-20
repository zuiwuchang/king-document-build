package manipulator

import (
	"fmt"
	"io/ioutil"
	"modules/db/data"
	"os"
)

type Section struct {
}

func (s *Section) New(bean *data.Section) error {
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
	if has, err = session.Id(bean.Panel).Get(&data.Panel{}); err != nil {
		return err
	} else if !has {
		err = fmt.Errorf("chapter id not found (%v)", bean.Panel)
		return err
	}

	if _, err = session.InsertOne(bean); err != nil {
		return err
	}
	dir := GetRootPath() + "/sections/" + fmt.Sprint(bean.Id)
	if err = os.MkdirAll(dir, 0774); err != nil {
		return nil
	}
	return nil
}

func (s *Section) Find(panel int64, beans *[]data.Section) error {
	return GetEngine().Where("panel = ?", panel).Desc("Sort").Find(beans)
}
func (s *Section) Read(bean *data.Section) {
	path := GetRootPath() + "/sections/" + fmt.Sprint(bean.Id) + ".txt"
	b, e := ioutil.ReadFile(path)
	if e != nil {
		return
	}
	bean.Str = string(b)
}
func (s *Section) Save(id int64, val string) error {
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
	var has bool
	if has, err = session.ID(id).Cols("id").Get(&data.Section{}); err != nil {
		return err
	} else if !has {
		return fmt.Errorf("section id not found (%v)", id)
	}

	path := GetRootPath() + "/sections/" + fmt.Sprint(id) + ".txt"
	err = ioutil.WriteFile(path, []byte(val), 0664)
	return nil
}

/*func (p *Panel) Rename(bean *data.Panel) error {
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
*/
