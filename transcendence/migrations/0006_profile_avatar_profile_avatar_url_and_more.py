# Generated by Django 5.1 on 2024-10-14 18:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('transcendence', '0005_remove_profile_email_remove_profile_first_name_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='avatar',
            field=models.ImageField(blank=True, upload_to='avatars/'),
        ),
        migrations.AddField(
            model_name='profile',
            name='avatar_url',
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='campus_name',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='profile',
            name='display_name',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='profile',
            name='kind',
            field=models.CharField(blank=True, max_length=42),
        ),
        migrations.AddField(
            model_name='profile',
            name='language',
            field=models.CharField(blank=True, max_length=42),
        ),
        migrations.AddField(
            model_name='profile',
            name='language_id',
            field=models.CharField(blank=True, max_length=10),
        ),
        migrations.AddField(
            model_name='profile',
            name='time_zone',
            field=models.CharField(blank=True, max_length=84),
        ),
    ]