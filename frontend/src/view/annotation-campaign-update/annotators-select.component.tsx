import { FC } from "react";
import { ListChooser } from "../global-components";
import { UserList } from "../../services/api";

export const AnnotatorsSelectComponent: FC<{
  users: UserList,
  setUsers: (users: UserList) => void,
  annotators: UserList,
  setAnnotators: (annotators: UserList) => void,
  annotationGoal: number,
  setAnnotationGoal: (annotationGoal: number) => void,
}> = ({ users, annotators, annotationGoal, setUsers, setAnnotators, setAnnotationGoal }) => {

  const handleAddAnnotator = (id: number) => {
    const user = users?.find(u => u.id === id);
    if (!user) return;
    setAnnotators([...(annotators ?? []), user])
    setUsers(users?.filter(u => u.id !== id))
    setAnnotationGoal(Math.max(1, annotationGoal))
  }

  const handleRemoveAnnotator = (id: number) => {
    const user = annotators?.find(u => u.id === id);
    if (!user) return;
    setAnnotators(annotators?.filter(u => u.id !== id))
    setUsers([...(users ?? []), user])
    setAnnotationGoal(Math.min(annotationGoal, annotators.length));
  }

  return (
    <div className="form-group">
      <label>Choose annotators:</label>
      <ListChooser choice_type="user"
                   choices_list={ [...new Set(users.map(u => ({ ...u, name: u.email })).sort((a, b) => a.name.localeCompare(b.name)))] }
                   chosen_list={ annotators.map(u => ({ ...u, name: u.email })) }
                   onSelectChange={ handleAddAnnotator }
                   onDelClick={ handleRemoveAnnotator }/>
    </div>
  )
}
