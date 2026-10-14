export interface Permission {
  id: string
  name: string
  guard_name: string

  group: string
  group_label: string
  group_description: string

  resource: string
  label: string
  description: string

  action: string
  action_label: string
}
