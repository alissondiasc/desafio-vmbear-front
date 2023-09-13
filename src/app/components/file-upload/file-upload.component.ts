import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {FileUploadService} from "../../services/file-upload.service";
import {HttpEventType, HttpResponse} from "@angular/common/http";
import * as converter from 'xml-js';
import {ToastrService} from "ngx-toastr";


@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css'],

})
export class FileUploadComponent implements OnInit {

  progress = 0;
  loader: boolean = false;

  files: any[] = [{file: null, name: 'Select file'}];
  fileInfos?: Observable<any>;
  outputXml: any[] = [];

  constructor(private uploadService: FileUploadService, private toastrService: ToastrService) {
  }

  ngOnInit(): void {
  }

  selectFile(event: any): void {

    if (event.target.files) {
      const files: File[] = event.target.files;
      this.files = Array.prototype.map.call(files, value => {
        return {
          name: value.name,
          file: value
        }
      });

      this.files.map(value => value.file).forEach(value => this.parseXml(value));

    } else {
      this.removeAllItems()
    }
  }

  parseXml(event: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      let xml = e.target.result;
      let xmlString: string = converter.xml2json(xml, {compact: true, spaces: 2});

      const JSONData = JSON.parse(xmlString);
      this.removeAveragePrice(JSONData);

      this.outputXml.push(converter.json2xml( JSON.stringify(JSONData), {compact: true, spaces: 4}))

    }
    reader.readAsText(event)
  }

  private removeAveragePrice(JSONData: any) {
    if (!!JSONData.agentes.agente.length) {
      this.removeAveragePriceOfAgenteList(JSONData);
    } else {
      this.removeAveragePriceOfAgenteObject(JSONData);
    }
  }

  private removeAveragePriceOfAgenteObject(JSONData: any) {
    JSONData.agentes.agente.regiao.map((o: { precoMedio: string; }) => {
      o.precoMedio = "";
      return o;
    })
  }

  private removeAveragePriceOfAgenteList(JSONData: any) {
    JSONData.agentes.agente.map((value: any) => {
      return value.regiao.map((o: { precoMedio: string; }) => {
        o.precoMedio = "";
        return o;
      })
    })
  }

  upload(xml?: string): void {
    if(xml == null ){
      this.outputXml.forEach(value => {
        this.callProvider(value)
      })
    }


  }
  callProvider(xml: string){
    this.loader = true;
    this.uploadService.upload(xml).subscribe(
      (event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
        } else if (event instanceof HttpResponse) {
          this.loader = false;
          this.removeAllItems();
          this.showSuccess();
        }
      },
      (err: any) => {
        this.loader = false;
        this.progress = 0;
        this.showError();
      });
  }

  removeAllItems(): void {
    this.files = [{file: null, name: 'Select file'}];
    this.outputXml = []
  }

  checkIfFilesExists(): boolean {
    return this.files.filter(value => !!value.file).length > 0
  }

  removeItem(file: any) {
    if (this.files.length == 1) {
      this.removeAllItems()
    } else {
      this.files.splice(this.files.indexOf(file), 1);
    }
  }
  public showSuccess(): void {
    this.toastrService.success('Operação realizada com sucesso!', 'Sucesso');
  }

  public showError(): void {
    this.toastrService.error('Ops !!', 'Tivemos problemas ao relaizar operação');
  }
}
