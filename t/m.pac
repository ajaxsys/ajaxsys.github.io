function FindProxyForURL(url, host)
{
  if (host == "music.163.com") 
    return "PROXY 124.126.126.105:80;PROXY 122.72.0.242:8080;PROXY 123.59.25.227:80;PROXY 122.96.59.99:83;PROXY 115.182.83.38:8080;";

  return "DIRECT";
}
