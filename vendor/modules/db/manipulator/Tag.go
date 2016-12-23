package manipulator

import (
	"fmt"
	"modules/db/data"
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
			err = fmt.Errorf("tag pid not found (%v)", pid)
			return err
		}
	}

	_, err = session.InsertOne(bean)
	return err
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
func (t *Tag) Move(id, pid int64) error {
	if pid == id {
		return fmt.Errorf("id cann't equal pid (%v)", id)
	}

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
	tmp := pid
	var has bool
	for tmp != 0 {
		var bean data.Tag
		if has, err = session.Id(tmp).Get(&bean); err != nil {
			return err
		} else if !has {
			err = fmt.Errorf("tag id not found (%v)", bean.Id)
			return err
		} else if bean.Pid == id {
			err = fmt.Errorf("tag id is pid's parent (%v,%v)", id, pid)
			return err
		}
		tmp = bean.Pid
	}
	var n int64
	if n, err = session.Id(id).MustCols("pid").Update(data.Tag{Pid: pid}); err != nil {
		return err
	} else if n == 0 {
		err = fmt.Errorf("tag id not found (%v)", id)
		return err
	}
	return nil
}
func (t *Tag) Remove(id int64) error {
	if id == 0 {
		return fmt.Errorf("tag id not found (%v)", id)
	}

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
	slice := make([]int64, 1, 1)
	slice[0] = id
	n := len(slice)
	for n > 0 {
		ids := make([]int64, 0, 100)
		for i := 0; i < n; i++ {
			if _, err = session.Id(slice[i]).Delete(data.Tag{}); err != nil {
				return err
			}
			if _, err = session.Where("tag = ?", slice[i]).MustCols("tag").Update(data.Document{}); err != nil {
				return err
			}

			var beans []data.Tag
			if err = session.Where("pid = ?", slice[i]).Find(&beans); err != nil {
				return err
			}
			for j := 0; j < len(beans); j++ {
				ids = append(ids, beans[j].Id)
			}
		}
		slice = ids
		n = len(slice)
	}
	return nil
}
func (t *Tag) Sort(sorts []data.Sort) error {
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
		if _, err := session.Id(sort.Id).MustCols("sort").Update(data.Tag{Sort: sort.Sort}); err != nil {
			return err
		}
	}
	return nil
}
func (t *Tag) FindPath(id int64, beans *[]data.Tag) error {
	sesion := NewSession()
	defer sesion.Close()
	err := sesion.Begin()
	if err != nil {
		return err
	}
	defer func() {
		if err == nil {
			sesion.Commit()
		} else {
			sesion.Rollback()
		}
	}()

	*beans = make([]data.Tag, 0, 20)
	var has bool
	for id != 0 {
		var bean data.Tag
		if has, err = sesion.Id(id).Get(&bean); err != nil {
			return err
		} else if !has {
			return fmt.Errorf("tag id not found (%v)", id)
		}
		*beans = append(*beans, bean)
		id = bean.Pid
	}

	for i, j := 0, len(*beans)-1; i < j; i, j = i+1, j-1 {
		(*beans)[i], (*beans)[j] = (*beans)[j], (*beans)[i]
	}
	return nil
}
