export const taskTemplates = {
    'notification':
        `task: example
actions:   
  - cmd.for_each({{ ['a','b','c'] }}) => $index_o, $o:
     - cmd.if( {{ $o == 'a'}} ):
         - cmd.print(A)`,

    'desktop-ui':
        `task: example
actions:   
  - cmd.for_each({{ ['a','b','c'] }}) => $index_o, $o:
     - cmd.if( {{ $o == 'a'}} ):
         - cmd.print(A)`,

    'web-search': 
        `task: example
actions:   
  - cmd.for_each({{ ['a','b','c'] }}) => $index_o, $o:
     - cmd.if( {{ $o == 'a'}} ):
         - cmd.print(A)`,
}
