# https://juejin.cn/post/6883043976413184013
!macro customInstall
  DetailPrint "Register autool URI Handler"
  DeleteRegKey HKCR "autool"
  WriteRegStr HKCR "autool" "" "URL:autool"
  WriteRegStr HKCR "autool" "URL Protocol" ""
  WriteRegStr HKCR "autool\shell" "" ""
  WriteRegStr HKCR "autool\shell\Open" "" ""
  WriteRegStr HKCR "autool\shell\Open\command" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME} %1"
!macroend


!macro customUnInstall
  DeleteRegKey HKCR "autool"
!macroend