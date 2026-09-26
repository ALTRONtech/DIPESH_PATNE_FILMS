from rest_framework import serializers

class EnquirySerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)
    phone = serializers.CharField(max_length=40)
    service = serializers.CharField(max_length=100)
    message = serializers.CharField(max_length=3000)
    email = serializers.EmailField(required=False, allow_blank=True)
