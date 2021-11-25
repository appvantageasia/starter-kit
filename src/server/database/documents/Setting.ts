import { ObjectId } from 'mongodb';

export enum SettingId {
    DefaultLocale = 'defaultLocale',
    EncryptionKeyId = 'encryptionKeyId',
}

export type SettingCore<TKey extends SettingId> = {
    _id: ObjectId;
    settingId: TKey;
    date: Date;
};

export type EncryptionKeyIdSetting = SettingCore<SettingId.EncryptionKeyId> & { keyId: string };

export type DefaultLocaleSetting = SettingCore<SettingId.DefaultLocale> & { locale: string };

export type Setting = EncryptionKeyIdSetting | DefaultLocaleSetting;
