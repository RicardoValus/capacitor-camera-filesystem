import { Component } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera'
import { Directory, Filesystem } from '@capacitor/filesystem';
import { LoadingController, Platform } from '@ionic/angular';

const IMAGE_DIR = 'stored-images';

interface LocalFile {
  name: string;
  path: string;
  data: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  images: LocalFile[] = [];

  constructor(
    private platform: Platform,
    private loadingCtrl: LoadingController) { }

  async ngOnInit() {
    this.loadFiles();
  }

  async loadFiles() {
    this.images = [];
    const loading = await this.loadingCtrl.create({
      message: 'Carregando dados...',
    });
    await loading.present();

    Filesystem.readdir({
      directory: Directory.Data,
      path: IMAGE_DIR
    }).then(async (result) => {
      // console.log('AQUI: ', result);
      // this.loadFileData(result.files);
      const fileNames = result.files.map(file => file.name); // extrai os nomes dos arquivos
      await this.loadFileData(fileNames);
    }, async (err) => {
      console.log('err: ', err);
      await Filesystem.mkdir({
        directory: Directory.Data,
        path: IMAGE_DIR
      });
    }).then(() => {
      loading.dismiss();
    });
  }


  async loadFileData(fileNames: string[]) {
    for (let f of fileNames) {
      const filePath = `${IMAGE_DIR}/${f}`;

      const readFile = await Filesystem.readFile({
        directory: Directory.Data,
        path: filePath
      });

      this.images.push({
        name: f,
        path: filePath,
        data: `data:image/jpeg;base64,${readFile.data}`
      })

      // console.log('LER: ', readFile);
    }
  }

  async selectImage() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      saveToGallery: true
    });

    console.log(image);

    if (image) {
      this.saveImage(image);
    }
  }

  async saveImage(photo: Photo) {
    const base64Data = await this.readAsBase64(photo);
    // console.log(base64Data);
    const fileName = new Date().getTime() + '.jpeg';

    const savedFile = await Filesystem.writeFile({
      directory: Directory.Data,
      path: `${IMAGE_DIR}/${fileName}`,
      data: base64Data
    });

    console.log('Salvo: ', savedFile);

    this.loadFiles();
  }

  async readAsBase64(photo: Photo) {

    if (this.platform.is('hybrid')) {

      const file = await Filesystem.readFile({
        path: photo.path!
      });

      return file.data;
    }
    else {

      const response = await fetch(photo.webPath!);
      const blob = await response.blob();

      return await this.convertBlobToBase64(blob) as string;
    }
  }

  convertBlobToBase64 = (blob: Blob) => new Promise(
    (resolve, reject) => {
      const reader = new FileReader;
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });

  async startUpload(file: LocalFile) {
    const response = await fetch(file.data);
    // console.log(" ~file: home.page.ts ~ linha 138 ~ HomePage ~ startUpload ~ response", response);
    const blob = await response.blob();
    // console.log(" ~ file: home.page.ts ~ linha 140 ~ HomePage ~ startUpload ~ blob", blob)
  }

  async deleteImage(file: LocalFile) {
    await Filesystem.deleteFile({
      directory: Directory.Data,
      path: file.path
    });
    this.loadFiles();

  }

}