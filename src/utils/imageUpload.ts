/**
 * 画像アップロード関連のユーティリティ関数
 * Firebase Storageを使用して画像をアップロード
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * 画像をリサイズする
 */
export const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // アスペクト比を維持しながらリサイズ
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('画像のリサイズに失敗しました'));
          }
        }, file.type);
      };
      img.onerror = () => reject(new Error('画像の読み込みに失敗しました'));
    };
    reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
  });
};

/**
 * プロフィール画像（アバター）をアップロード
 */
export const uploadAvatarImage = async (userId: string, file: File): Promise<string> => {
  try {
    // 画像を512x512にリサイズ
    const resizedBlob = await resizeImage(file, 512, 512);

    // Storageのパス
    const storageRef = ref(storage, `avatars/${userId}/${Date.now()}_avatar.jpg`);

    // アップロード
    await uploadBytes(storageRef, resizedBlob);

    // ダウンロードURLを取得
    const downloadURL = await getDownloadURL(storageRef);

    console.log('✅ Avatar uploaded:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Avatar upload error:', error);
    throw new Error('プロフィール画像のアップロードに失敗しました');
  }
};

/**
 * カバー画像をアップロード
 */
export const uploadCoverImage = async (userId: string, file: File): Promise<string> => {
  try {
    // 画像を1200x400にリサイズ
    const resizedBlob = await resizeImage(file, 1200, 400);

    // Storageのパス
    const storageRef = ref(storage, `covers/${userId}/${Date.now()}_cover.jpg`);

    // アップロード
    await uploadBytes(storageRef, resizedBlob);

    // ダウンロードURLを取得
    const downloadURL = await getDownloadURL(storageRef);

    console.log('✅ Cover uploaded:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Cover upload error:', error);
    throw new Error('カバー画像のアップロードに失敗しました');
  }
};

/**
 * 投稿画像をアップロード
 */
export const uploadPostImage = async (userId: string, file: File): Promise<string> => {
  try {
    // 画像を1080x1080にリサイズ
    const resizedBlob = await resizeImage(file, 1080, 1080);

    // Storageのパス
    const storageRef = ref(storage, `posts/${userId}/${Date.now()}_${file.name}`);

    // アップロード
    await uploadBytes(storageRef, resizedBlob);

    // ダウンロードURLを取得
    const downloadURL = await getDownloadURL(storageRef);

    console.log('✅ Post image uploaded:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Post image upload error:', error);
    throw new Error('投稿画像のアップロードに失敗しました');
  }
};

/**
 * 画像を削除
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
    console.log('✅ Image deleted:', imageUrl);
  } catch (error) {
    console.error('Image deletion error:', error);
    throw new Error('画像の削除に失敗しました');
  }
};

/**
 * 画像ファイルのバリデーション
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // ファイルサイズチェック（10MB以下）
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: '画像サイズは10MB以下にしてください' };
  }

  // ファイルタイプチェック
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: '対応している画像形式: JPEG, PNG, GIF, WebP' };
  }

  return { valid: true };
};
