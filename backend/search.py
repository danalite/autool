
import ctypes
import datetime
import struct

#defines
EVERYTHING_REQUEST_FILE_NAME = 0x00000001
EVERYTHING_REQUEST_PATH = 0x00000002
EVERYTHING_REQUEST_FULL_PATH_AND_FILE_NAME = 0x00000004
EVERYTHING_REQUEST_EXTENSION = 0x00000008
EVERYTHING_REQUEST_SIZE = 0x00000010
EVERYTHING_REQUEST_DATE_CREATED = 0x00000020
EVERYTHING_REQUEST_DATE_MODIFIED = 0x00000040
EVERYTHING_REQUEST_DATE_ACCESSED = 0x00000080
EVERYTHING_REQUEST_ATTRIBUTES = 0x00000100
EVERYTHING_REQUEST_FILE_LIST_FILE_NAME = 0x00000200
EVERYTHING_REQUEST_RUN_COUNT = 0x00000400
EVERYTHING_REQUEST_DATE_RUN = 0x00000800
EVERYTHING_REQUEST_DATE_RECENTLY_CHANGED = 0x00001000
EVERYTHING_REQUEST_HIGHLIGHTED_FILE_NAME = 0x00002000
EVERYTHING_REQUEST_HIGHLIGHTED_PATH = 0x00004000
EVERYTHING_REQUEST_HIGHLIGHTED_FULL_PATH_AND_FILE_NAME = 0x00008000

# https://www.voidtools.com/support/everything/sdk/python/

#dll imports
everything_dll = ctypes.WinDLL ("C:\\EverythingSDK\\DLL\\Everything32.dll")
everything_dll.Everything_GetResultDateModified.argtypes = [ctypes.c_int,ctypes.POINTER(ctypes.c_ulonglong)]
everything_dll.Everything_GetResultSize.argtypes = [ctypes.c_int,ctypes.POINTER(ctypes.c_ulonglong)]
everything_dll.Everything_GetResultFileNameW.argtypes = [ctypes.c_int]
everything_dll.Everything_GetResultFileNameW.restype = ctypes.c_wchar_p

#setup search
everything_dll.Everything_SetSearchW("test.py")
everything_dll.Everything_SetRequestFlags(EVERYTHING_REQUEST_FILE_NAME | EVERYTHING_REQUEST_PATH | EVERYTHING_REQUEST_SIZE | EVERYTHING_REQUEST_DATE_MODIFIED)

#execute the query
everything_dll.Everything_QueryW(1)

#get the number of results
num_results = everything_dll.Everything_GetNumResults()

#show the number of results
print("Result Count: {}".format(num_results))

#convert a windows FILETIME to a python datetime
#https://stackoverflow.com/questions/39481221/convert-datetime-back-to-windows-64-bit-filetime
WINDOWS_TICKS = int(1/10**-7)  # 10,000,000 (100 nanoseconds or .1 microseconds)
WINDOWS_EPOCH = datetime.datetime.strptime('1601-01-01 00:00:00',
                                           '%Y-%m-%d %H:%M:%S')
POSIX_EPOCH = datetime.datetime.strptime('1970-01-01 00:00:00',
                                         '%Y-%m-%d %H:%M:%S')
EPOCH_DIFF = (POSIX_EPOCH - WINDOWS_EPOCH).total_seconds()  # 11644473600.0
WINDOWS_TICKS_TO_POSIX_EPOCH = EPOCH_DIFF * WINDOWS_TICKS  # 116444736000000000.0

def get_time(filetime):
    """Convert windows filetime winticks to python datetime.datetime."""
    winticks = struct.unpack('<Q', filetime)[0]
    microsecs = (winticks - WINDOWS_TICKS_TO_POSIX_EPOCH) / WINDOWS_TICKS
    return datetime.datetime.fromtimestamp(microsecs)

#create buffers
filename = ctypes.create_unicode_buffer(260)
date_modified_filetime = ctypes.c_ulonglong(1)
file_size = ctypes.c_ulonglong(1)

#show results
for i in range(num_results):

	everything_dll.Everything_GetResultFullPathNameW(i,filename,260)
	everything_dll.Everything_GetResultDateModified(i,date_modified_filetime)
	everything_dll.Everything_GetResultSize(i,file_size)
	print("Filename: {}\nDate Modified: {}\nSize: {} bytes\n".format(ctypes.wstring_at(filename),get_time(date_modified_filetime),file_size.value))