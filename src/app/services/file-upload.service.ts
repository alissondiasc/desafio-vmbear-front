import { Injectable } from '@angular/core';
import {HttpClient, HttpRequest, HttpEvent, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  private baseUrl = 'http://localhost:8080/api/create';

  constructor(private http: HttpClient) { }

  upload(xmls: string): Observable<HttpEvent<any>> {

    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', ' application/xml');
    // headers = headers.append('Accept', 'text/xml');

    const req = new HttpRequest('POST', `${this.baseUrl}`, xmls, {
      headers: headers,
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }

  getFiles(): Observable<any> {
    return this.http.get(`${this.baseUrl}/files`);
  }
}
